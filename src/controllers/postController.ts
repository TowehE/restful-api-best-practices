import { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/postService';
import { ResponseUtils } from '../utils';
import { CreatePostRequest, UpdatePostRequest, PaginationQuery, AuthenticatedRequest } from '../types';

export class PostController {
  static async createPost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const postData: CreatePostRequest = req.body;
      
      const post = await PostService.createPost(userId, postData);

      res.status(201).json(
        ResponseUtils.success('Post created successfully', post)
      );
    } catch (error) {
      next(error);
    }
  }

  static async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: PaginationQuery = req.query;
      const result = await PostService.getPosts(query);

      res.status(200).json(
        ResponseUtils.success('Posts retrieved successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  static async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const post = await PostService.getPostById(id);

      res.status(200).json(
        ResponseUtils.success('Post retrieved successfully', post)
      );
    } catch (error) {
      next(error);
    }
  }

  static async updatePost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const postData: UpdatePostRequest = req.body;

      const post = await PostService.updatePost(id, userId, postData);

      res.status(200).json(
        ResponseUtils.success('Post updated successfully', post)
      );
    } catch (error) {
      next(error);
    }
  }

  static async deletePost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await PostService.deletePost(id, userId);

      res.status(200).json(
        ResponseUtils.success('Post deleted successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  static async getUserPosts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query: PaginationQuery = req.query;
      
      const result = await PostService.getUserPosts(userId, query);

      res.status(200).json(
        ResponseUtils.success('User posts retrieved successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }
}