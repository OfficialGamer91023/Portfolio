import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const CV_FILENAME = 'Muhammad_Rafay_Irfan_CV.pdf';
const CV_PATH = path.resolve(__dirname, '../../assets/cv.pdf');

/**
 * GET /api/cv — streams the CV PDF as a downloadable file.
 */
export async function downloadCV(_req: Request, res: Response): Promise<void> {
  try {
    if (!fs.existsSync(CV_PATH)) {
      res.status(404).json({ error: 'CV file not found', status: 404 });
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${CV_FILENAME}"`);

    const fileStream = fs.createReadStream(CV_PATH);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving CV:', error);
    res.status(500).json({ error: 'Failed to serve CV', status: 500 });
  }
}
