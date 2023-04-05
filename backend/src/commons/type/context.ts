export interface IUser {
  user: {
    email: string;
    userID: string;
  };
}

export interface IContext {
  req?: Request & IUser; //&를 통해 합쳐서 req.header와 req.user 모두 가능하게 함.
  res?: Response;
}

export interface IOAuthUser {
  user: {
    hashedPassword: string;
    name: string;
    email: string;
    // age: number;
  };
}

// export interface IOAuthUser {
//   user: {
//     name: string;
//     phonenumber: number;
//     email: string;
//     address: string;
//     hashedPassword: string;
//     signupdate: Date;
//     age: number;
//   };
// }
