import { Router, Request, Response } from 'express';

// media.controller.ts
// MediaController: Handles multimedia functionality (e.g., playback of various media types)
export class MediaController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.playMedia();
    this.uploadMedia();
  }

  // 멀티 미디어 재생 (GET /api/v1/tips/{tipId}/media/play)
  private playMedia() {
    this.router.get('/api/v1/tips/:tipId/media/play', (req: Request, res: Response) => {
      const { tipId } = req.params;
      
      // Swagger 문서화
      /**
       * @swagger
       * /api/v1/tips/{tipId}/media/play:
       *   get:
       *     summary: "Play multimedia content"
       *     description: "Retrieves the multimedia content for the given tip ID and plays it."
       *     operationId: playMedia
       *     parameters:
       *       - in: path
       *         name: tipId
       *         required: true
       *         schema:
       *           type: integer
       *         description: "The ID of the tip whose media needs to be played."
       *     responses:
       *       '200':
       *         description: "Successfully retrieved the media content"
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 media_url:
       *                   type: string
       *                   description: "The URL of the media content."
       *                 media_type:
       *                   type: string
       *                   description: "The type of media (e.g., image, video)."
       *       '404':
       *         description: "Tip not found"
       *       '500':
       *         description: "Internal server error"
       */
      
      res.status(200).json({
        media_url: `https://example.com/media/${tipId}`,
        media_type: 'video', // media_type을 영상이나 이미지로 지정할 수 있음
      });
    });
  }

  // 멀티 미디어 업로드 (POST /api/v1/tips/{tipId}/media/upload)
  private uploadMedia() {
    this.router.post('/api/v1/tips/:tipId/media/upload', (req: Request, res: Response) => {
      const { tipId } = req.params;

      // Swagger 문서화
      /**
       * @swagger
       * /api/v1/tips/{tipId}/media/upload:
       *   post:
       *     summary: "Upload multimedia content"
       *     description: "Uploads multimedia content for the given tip ID."
       *     operationId: uploadMedia
       *     parameters:
       *       - in: path
       *         name: tipId
       *         required: true
       *         schema:
       *           type: integer
       *         description: "The ID of the tip to which the media will be uploaded."
       *     requestBody:
       *       required: true
       *       content:
       *         multipart/form-data:
       *           schema:
       *             type: object
       *             properties:
       *               media:
       *                 type: string
       *                 format: binary
       *                 description: "The media file to upload."
       *     responses:
       *       '201':
       *         description: "Successfully uploaded the media content"
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 media_url:
       *                   type: string
       *                   description: "The URL of the uploaded media."
       *                 media_type:
       *                   type: string
       *                   description: "The type of the uploaded media (e.g., image, video)."
       *       '400':
       *         description: "Invalid media file format"
       *       '404':
       *         description: "Tip not found"
       *       '500':
       *         description: "Internal server error"
       */
      
      res.status(201).json({
        media_url: `https://example.com/media/${tipId}/uploaded-media`,
        media_type: 'image', // media_type을 이미지나 영상으로 지정할 수 있음
      });
    });
  }
}
