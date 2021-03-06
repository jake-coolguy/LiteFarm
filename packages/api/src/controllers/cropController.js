/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (cropController.js) is part of LiteFarm.
 *  
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *  
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

const baseController = require('../controllers/baseController');
const cropModel = require('../models/cropModel');
const { transaction, Model } = require('objection');

class cropController extends baseController {
  constructor() {
    super();
  }

  static addCropWithFarmID() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        req.body.user_added = true;
        const result = await baseController.postWithResponse(cropModel, req.body, trx);
        await trx.commit();
        res.status(201).send(result);
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    };
  }

  static getAllCrop() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const rows = await cropController.get(farm_id);
        if (!rows.length) {
          res.sendStatus(404)
        }
        else {
          res.status(200).send(rows);
        }
      }
      catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    }
  }

  static getIndividualCrop() {
    return async (req, res) => {
      try {
        const id = req.params.id;
        const row = await baseController.getIndividual(cropModel, id);
        if (!row.length) {
          res.sendStatus(404)
        }
        else {
          res.status(200).send(row);
        }
      }
      catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    }
  }

  // should only delete user added crop
  static delCrop() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const isDeleted = await cropController.del(req, trx);
        await trx.commit();
        if (isDeleted) {
          res.sendStatus(200);
        }
        else {
          res.sendStatus(404);
        }
      }
      catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  }

  static updateCrop() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      try {
        const updated = await baseController.put(cropModel, req.params.id, req.body, trx);
        await trx.commit();
        if (!updated.length) {
          res.sendStatus(404);
        }
        else {
          res.status(200).send(updated);
        }

      }
      catch (error) {
        await trx.rollback();
        res.status(400).json({
          error,
        });
      }
    }
  }

  static async get(farm_id){
    return await cropModel.query().where('user_added', false).orWhere('farm_id', farm_id);
  }

  static async del(req, trx){
    const id = req.params.id;
    const table_id = cropModel.idColumn;
    return await cropModel.query(trx).where(table_id, id).andWhere('user_added', true).del()
  }
}

module.exports = cropController;
