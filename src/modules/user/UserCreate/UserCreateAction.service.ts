import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { InjectConnection } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { UserCreatePayloadDto } from "./UserCreateRequest.dto";
import { User, UserDocument } from "../user.schema";

@Injectable()
export class UserCreateAction {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  async create(payload: UserCreatePayloadDto) : Promise<User>{
    return new this.userModel(payload).save();
  }
}
