import { Router ,Request, Response } from 'express';

export class BookmarkController {
    public router: Router;

// 북마크된 꿀팁 목록을 조회하는 GET 요청 처리 (빈 응답)
private getBookmarks() {
    /**
     * @swagger
     * /api/v1/users/bookmarks:
     *   get:
     *     summary: 저장된 꿀팁 목록 조회
     *     description: 사용자가 저장한 북마크된 꿀팁 목록을 조회합니다.
     *     tags:
     *       - Bookmarks
     *     responses:
     *       200:
     *         description: 저장된 꿀팁 목록 조회 성공
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 resultType:
     *                   type: string
     *                   example: "SUCCESS"
     *                 success:
     *                   type: object
     *                   properties:
     *                     bookmarks:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: integer
     *                             example: 1
     *                           title:
     *                             type: string
     *                             example: "Summer Vacation Tips"
     *                           content:
     *                             type: string
     *                             example: "Don't forget your sunscreen!"
     *       400:
     *         description: 잘못된 요청 
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 resultType:
     *                   type: string
     *                   example: "FAIL"
     *                 error:
     *                   type: object
     *                   properties:
     *                     errorCode:
     *                       type: string
     *                       example: "A101"
     *                     reason:
     *                       type: string
     *                       example: "Invalid user or authentication failure"
     *                     data:
     *                       type: object
     *                       nullable: true
     *                       example: null
     *                 success:
     *                   type: object
     *                   nullable: true
     *                   example: null
     */
    
    this.router.get('/api/v1/users/bookmarks', (req: Request, res: Response) => {
      // 빈 응답 (실제 데이터가 없는 경우)
      res.status(200).send();
    });
  }

}

