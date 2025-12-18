require("dotenv/config");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app.js");
const User = require("../models/User.js");

beforeAll(async () => {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri);
});

afterEach(async () => {
    await User.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

test("POST /api/user/register => 201", async () => {
    await User.deleteMany({});
    
    const res = await request(app)
        .post("/api/user/register")
        .send({ 
            username: "testuser", 
            email: "test@test.com", 
            password: "password123" 
        });

    expect(res.status).toBe(201);
    expect(res.body.user.username).toBe("testuser");
    expect(res.body.user.email).toBe("test@test.com");
});

test("POST /api/user/register => 400 (email déjà utilisé)", async () => {
    await User.create({
        username: "existing",
        email: "test@test.com",
        password: "hashed"
    });

    const res = await request(app)
        .post("/api/user/register")
        .send({ 
            username: "newuser", 
            email: "test@test.com", 
            password: "password123" 
        });

    expect(res.status).toBe(400);
});

test("POST /api/user/login => 200", async () => {
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash("password123", 10);
    await User.create({
        username: "testuser",
        email: "test@test.com",
        password: hashedPassword
    });

    const res = await request(app)
        .post("/api/user/login")
        .send({ 
            email: "test@test.com", 
            password: "password123" 
        });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@test.com");
});