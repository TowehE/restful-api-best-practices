import { Post, Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CreatePostRequest, UpdatePostRequest, PaginationQuery, PaginatedResponse } from '../types';
import { AppError } from '../middleware/errorHandler';

type PostWithAuthor = Post & {
  author: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
};

export class PostService {
  static async createPost(userId: string, postData: CreatePostRequest): Promise<PostWithAuthor> {
    const post = await prisma.post.create({
      data: {
        ...postData,
        authorId: userId,
        publishedAt: postData.published ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return post;
  }

  static async getPosts(query: PaginationQuery): Promise<PaginatedResponse<PostWithAuthor>> {
    const page = parseInt(query.page || '1');
    const limit = Math.min(parseInt(query.limit || '10'), 100); // Max 100 per page
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PostWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.published !== undefined) {
      where.published = query.published === 'true';
    }

    // Build orderBy clause
    const orderBy: Prisma.PostOrderByWithRelationInput = {};
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    if (sortBy === 'author') {
      orderBy.author = { username: sortOrder };
    } else {
      orderBy[sortBy as keyof Post] = sortOrder;
    }

    // Get total count
    const total = await prisma.post.count({ where });

    // Get posts
    const posts = await prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    };
  }

  static async getPostById(postId: string): Promise<PostWithAuthor> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    return post;
  }

  static async updatePost(postId: string, userId: string, postData: UpdatePostRequest): Promise<PostWithAuthor> {
    // First check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      throw new AppError('Post not found', 404);
    }

    if (existingPost.authorId !== userId) {
      throw new AppError('Not authorized to update this post', 403);
    }

    const updateData: Prisma.PostUpdateInput = { ...postData };

    // Handle publishedAt field
    if (postData.published !== undefined) {
      if (postData.published && !existingPost.published) {
        // Publishing for the first time
        updateData.publishedAt = new Date();
      } else if (!postData.published && existingPost.published) {
        // Unpublishing
        updateData.publishedAt = null;
      }
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return post;
  }

  static async deletePost(postId: string, userId: string): Promise<void> {
    // First check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      throw new AppError('Post not found', 404);
    }

    if (existingPost.authorId !== userId) {
      throw new AppError('Not authorized to delete this post', 403);
    }

    await prisma.post.delete({
      where: { id: postId }
    });
  }

  static async getUserPosts(userId: string, query: PaginationQuery): Promise<PaginatedResponse<PostWithAuthor>> {
    const page = parseInt(query.page || '1');
    const limit = Math.min(parseInt(query.limit || '10'), 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PostWhereInput = { authorId: userId };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.published !== undefined) {
      where.published = query.published === 'true';
    }

    // Build orderBy clause
    const orderBy: Prisma.PostOrderByWithRelationInput = {};
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    orderBy[sortBy as keyof Post] = sortOrder;

    // Get total count
    const total = await prisma.post.count({ where });

    // Get posts
    const posts = await prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    };
  }
}