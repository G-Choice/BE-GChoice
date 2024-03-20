
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
  WAITING_CONFIRMATION_ORDER = 'waiting_confirmation_order',
  WAITING_DELIVERY = 'waiting_delivery',
  FETCHING_ITEMS = 'fetching_items',
  COMPLETED = 'completed',
}