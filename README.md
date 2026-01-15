# PostHub API

A RESTful social media API built with NestJS, TypeScript, and PostgreSQL.

## 🔗 Quick Links

- **Live API**: [https://posthub.bestapi.uz](https://posthub.bestapi.uz)
- **API Documentation**: [https://posthub.bestapi.uz/docs](https://posthub.bestapi.uz/docs)
- **Community**: [https://t.me/PostHubCommunity](https://t.me/PostHubCommunity)

> ⚠️ **Note**: This project uses free hosting. Under heavy load, expect slower response times. For production, deploy your own instance.

## ✨ Features

- JWT Authentication (access & refresh tokens)
- User profiles with search
- Posts, comments, and likes
- Follow/unfollow system
- Email verification
- Automated account cleanup
- Full Swagger documentation

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL, TypeORM
- **Auth**: JWT, bcrypt
- **Email**: Nodemailer
- **Docs**: Swagger/OpenAPI

## 👨‍💻 For Frontend Developers

This is an open API for learning. You can:
- Use the live API for your projects
- Build React, Vue, Angular apps
- Test everything in [Swagger docs](https://posthub.bestapi.uz/docs)
- Deploy your own instance

**Built a frontend with this API?** Share it with us in the [community](https://t.me/PostHubCommunity) 😊

## 📝 License

MIT

## 📧 Contact

- **Author**: Behruz Xurramov
- **Email**: bxurramov597@gmail.com
- **GitHub**: [@BehruzXurramov](https://github.com/BehruzXurramov)
- **Issues**: [GitHub Issues](https://github.com/BehruzXurramov/PostHub-NestJS/issues)

---

## ⚙️ Environment Variables

If you want to run this project locally, create a `.env` file:

```env
PORT=3000
NODE_ENV=development
THE_URL=http://localhost:3000

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=posthub

JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
JWT_ACTIVATION_SECRET=your_secret
JWT_UPDATE_SECRET=your_secret

JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
JWT_ACTIVATION_EXPIRATION=24h
JWT_UPDATE_EXPIRATION=1h

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```
