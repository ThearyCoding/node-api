import { Request, Response } from 'express';
import Banner from '../../models/banner.model';
import { logger } from '../../../commons/logger.middleware';

export class BannerController {
  constructor() { }
  async getHomeBanner(req: Request, res: Response) {

    try {
      const bannerHorizontal = await Banner.aggregate([{
        $match: {
          $and: [
            { image_type: 'h' },
            { chr_publish: 'Y' }
          ]
        }

      },
      { $skip: 0 },
      { $sort: { _id: -1 } },
      { $limit: 2 }
      ]
      );

      const bannerVertical = await Banner.aggregate([{
        $match: {
          $and: [
            { image_type: 'v' },
            { chr_publish: 'Y' }
          ]
        }

      },
      { $skip: 0 },
      { $sort: { _id: -1 } },
      { $limit: 2 }
      ]
      );
     
      res.status(200).send({ data: { horizontal_banner: bannerHorizontal, vertical_banner: bannerVertical } });

    } catch (e) {
      logger.error('', e);
      res.status(500).send({ message: 'Unexpected error' });
    }
  }
}