**#Portfolio Management System **


## Prerequisites
 Java 17 
 Node.js (v18+ recommended) 
MongoDB (local or cloud) 

# Installation 

1. Clone the Repository 
git clone https://github.com/Mayur8182/-java-mini-project-Portfolio-Management-System-.git

3. Backend Setup
    
cd backend-java 
mvn install 

5. Frontend Setup 
cd client 
npm install

6 .Running the Application 
Start MongoDB 
Make sure MongoDB service is running locally or configure cloud connec on.

## Environment Variables

Create a `.env` file in the root directory with these variables:

```env
MONGODB_URI=mongodbatals_url
NODE_ENV=development
SESSION_SECRET=your_session_secret
PORT=3000
```
7. Start the Backend Server 

8.cd backend-java 

9.mvn spring-boot:run 

 Start the Frontend 


10.cd client 

11.npm run dev 

## Features

- User Authentication
- Dashboard Analytics
- Real-time Market Data
- Portfolio Management
- Investment Tracking
- Risk Analysis
- AI Recommendations
- Tax Harvesting
- Report Generation
  
The application will now be available at: 
h p://localhost:3000/

## Database Setup

The application uses MongoDB Atlas. Make sure to:
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Configure network access (IP whitelist)
4. Create a database user
5. Get your connection string and add it to `.env`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Deployment

The application is configured for deployment on Render.com. The `render.yaml` file contains the necessary configuration.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
