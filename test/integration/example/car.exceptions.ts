import { HttpException, HttpStatus } from "@nestjs/common";

export class RegistrationPlateAlreadyExists extends HttpException {
    constructor() {
        super("Registration plate already exists!", HttpStatus.BAD_REQUEST);
    }
}

export class RegistrationPlateNotFound extends HttpException {
    constructor(registrationPlate: String) {
        super(`Registration plate '${registrationPlate}' was not found!`, HttpStatus.NOT_FOUND);
    }
}