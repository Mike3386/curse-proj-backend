export interface AuthUser {
  id: string;
  access_token: string;
  email: string;
  isAdmin: boolean;
}

export interface LoginUser {
  email: string;
  password: string;
}

export const adminUser = {
  email: 'admin@mail.ru',
  password: '12345',
};

export const testUser = {
  email: 'test1@test.com',
  password: '123',
};

export const testUser2 = {
  email: 'test2@test.com',
  password: '123',
};

export const testUser3 = {
  email: 'test3@test.com',
  password: '123',
};

export const testImage = {
  public_id: 't4gspvsyffe6b8fljttg',
  format: 'jpg',
  url: 'http://res.cloudinary.com/dty8w3lj5/image/authenticated/s--Dg22P1YT--/v1685478677/t4gspvsyffe6b8fljttg.jpg',
};

export const testImagePrivateLink =
  'https://api.cloudinary.com/v1_1/dty8w3lj5/image/download?timestamp=1685478677&public_id=t4gspvsyffe6b8fljttg&format=jpg&type=authenticated&expires_at=1717014677.853&signature=cbaf4c190ac06b46fb19732f223259e1ab6e7941&api_key=564632781544965';

export const testTags = [
  {
    confidence: 10,
    tag: {
      ru: 'Снег',
    },
  },
  {
    confidence: 20,
    tag: {
      ru: 'Зима',
    },
  },
  {
    confidence: 20,
    tag: {
      ru: 'Жизнь',
    },
  },
];
