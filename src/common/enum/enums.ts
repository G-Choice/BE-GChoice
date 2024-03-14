
export enum StatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintaining',
}

export enum  PositionEnum {
  ADMIN = 'admin',
  USER = 'user',
  SELLER= 'seller',
}
export enum  PositionGroupEnum {
  LEADER = 'leader',
  MEMBER = 'member',
}


export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}


export enum PositionStatusGroupEnum {
  WAITING_FOR_USER = 'waiting_for_user',
  WAITING_FOR_PAYMENT = 'waiting_for_payment',
  PAYMENT_SUCCESS = 'payment_success',
  CONFIRMATION_ORDER = 'confirmation_order',
  WAITING_DELIVERY = 'waiting_delivery',
  DONE = 'done',
}