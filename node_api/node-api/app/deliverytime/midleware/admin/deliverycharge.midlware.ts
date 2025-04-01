import express from 'express';

export class DeliveryTimeMiddleWare {
  private static instance: DeliveryTimeMiddleWare;

  static getInstance() {
    if (!DeliveryTimeMiddleWare.instance) {
      DeliveryTimeMiddleWare.instance = new DeliveryTimeMiddleWare();
    }
    return DeliveryTimeMiddleWare.getInstance;
  }
  validateDeliveryTimeFields(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!req.body.dt_start_time) {
      res.status(400).send({ message: 'Start time is required field' });
    } else if (!req.body.dt_end_time) {
      res.status(400).send({ message: 'End time is required field' });
    } else if (!req.body.dt_slot_end_time) {
      res.status(400).send({ message: 'Slot end time is required field' });
    } else if (!req.body.chr_type) {
      res.status(400).send({ message: 'Time is required field' });
    } else next();
  }
}
