import { IPrice } from './IGetPriceByItems';

export interface MessageContext {
  totalMessages: number;
  totalPrice: number;
}

export interface ISmsFee {
  totalFeeSms: number;
  totalFeeMms: number;
  totalSms: number;
}

export interface IChargeFee {
  totalFeeChargedMessagesUpdate: number;
  feeSms: ISmsFee;
  totalFeeUsed: number;
  totalFeeSub: number;
  totalSubs: number;
  price: IPrice;
  priceCharged: number;
  numberPhoneNumber: number;
  startDate: Date;
  endDate: Date;
}
