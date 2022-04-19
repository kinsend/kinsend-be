/* eslint-disable unicorn/consistent-destructuring */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { AuthVerifyApiKey } from "../auth/AuthVerifyApiKey/AuthVerifyApiKey.service";
import { UserCreateAction } from "./UserCreate/UserCreateAction.service";
import { UserCreatePayloadDto } from "./UserCreate/UserCreateRequest.dto";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UserController {
  constructor(
    private userCreateAction: UserCreateAction,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthVerifyApiKey)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  async create(@Req() request: Request, @Body() payload: UserCreatePayloadDto) {
    console.log(payload);

    return this.userCreateAction.create(payload);
  }
}
