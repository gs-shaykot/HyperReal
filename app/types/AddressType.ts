// export type AddressType = {
//       id       String @id @default (uuid())
//   userId   String
//   label    String ?
//     fullName String
//   street   String
//   city     String
//   state    String
//   zipCode  String
//   country  String
// }

export type AddressType = {
    id: string;
    userId: string;
    label?: string;
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    createdAt?: Date;
    isDefault?: boolean;
}