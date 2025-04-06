import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import {redis} from "../lib/redis.js";

/**
 * Generates authentication tokens for a user.
 *
 * @function generateTokens
 * @param {string} userId - The id of the user for whom the tokens are generated.
 * @returns {Object} - An object containing the access token and refresh token.
 * @property {string} accessToken - The access token to be used for authentication.
 * @property {string} refreshToken - The refresh token to be used for refreshing the access token.
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});
  const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
  return {accessToken, refreshToken};
}

/**
 * Stores a refresh token in Redis for a given user.
 *
 * @function storeRefreshToken
 * @param {string} userId - The id of the user for whom the refresh token is stored.
 * @param {string} refreshToken - The refresh token to be stored.
 * @returns {Promise<void>}
 * @throws {Error} If any error occurs while storing the refresh token.
 */
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refreshToken:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
}

/**
 * Sets the access and refresh token cookies on the response object.
 *
 * This function configures and sets HTTP-only cookies for access and refresh tokens
 * with security and expiration settings. The access token cookie has a short lifespan,
 * while the refresh token cookie lasts longer. Both cookies are only sent over secure
 * connections when in production.
 *
 * @param {Object} res - The HTTP response object used to set cookies.
 * @param {string} accessToken - The access token to be set in a cookie.
 * @param {string} refreshToken - The refresh token to be set in a cookie.
 */
const setCookie = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent cross-site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevent cross-site access
    maxAge: 15 * 60 * 1000
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent cross-site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevent cross-site access
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

/**
 * Registers a new user by creating a new user account with the provided details.
 *
 * This function checks if all required fields are provided and if the user already exists.
 * If the user does not exist, a new user is created and saved to the database.
 * Authentication tokens are generated and stored, and cookies are set for the client.
 *
 * @function signup
 * @param {Object} req - The HTTP request object containing user details in the body (name, email, and password).
 * @param {Object} res - The HTTP response object used to send a response back to the client.
 * @returns {Promise<void>}
 * @throws {Error} If any error occurs during the registration process, such as validation errors or server errors.
 */
export const signup = async (req, res) => {
  const {name, email, password} = req.body;
  try {

    // Input validation
    // if (!name || !email || !password) {
    //     return res.status(400).json({ message: "All fields are required" });
    // }

    // Check if user exists
    const userExists = await User.findOne({email});
    if (userExists) {
      return res.status(400).json({message: "User already exists"});
    }

    // Save user
    const user = await User.create({ name, email, password });

    // Authentication
    const {accessToken, refreshToken} = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    // Set cookies
    setCookie(res, accessToken, refreshToken);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: "User created successfully."
    });
  } catch (error) {
    console.error("Error in signup:", error);

    if (error.name === "ValidationError") {
      res.status(400).json({message: error.message});
    }

    res.status(500).json({message: error.message});
  }
}

/**
 * Authenticates a user using their email and password.
 * @function login
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<void>}
 * @throws {Error} If any error occurs during the authentication process.
 */
export const login = async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({message: "Email and password are required"});
    }

    // Check if user exists
    const user = await User.findOne({email});
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({message: "Invalid credentials"});
    }

    // Authentication
    const {accessToken, refreshToken} = generateTokens(user._id);

    try {
      await storeRefreshToken(user._id, refreshToken);
    } catch (error) {
      console.error("Error storing refresh token:", error);
      return res.status(500).json({message: "Error processing refresh token", error: error.message});
    }

    setCookie(res, accessToken, refreshToken);

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({message: error.message});
  }
}

/**
 * Logs out a user by invalidating the refresh token and clearing authentication cookies.
 *
 * This function extracts the refresh token from the request cookies and verifies it.
 * If the token is valid, it deletes the token from the Redis store and clears both the
 * access and refresh tokens from the client's cookies. If the token is missing or invalid,
 * an appropriate response is sent back.
 *
 * @param {Object} req - The HTTP request object, containing cookies with the refresh token.
 * @param {Object} res - The HTTP response object, used to send back the status and message.
 */
export const logout = async (req, res) => {
  try {
    const user = req.user;
    const refreshToken = req.cookies.refreshToken;
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (!refreshToken) {
      return res.sendStatus(204); // No content
    }

    if (!decoded) {
      return res.sendStatus(401); // Unauthorized
    }

    await redis.del(`refreshToken:${decoded.userId}`);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({
      status: "success",
      message: "Logout successful!"
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({status: "error", message: error.message});
  }
}

/**
 * Refreshes the access token using a valid refresh token.
 *
 * Extracts the refresh token from the request cookies and verifies its validity.
 * If the token is valid, a new access token is generated and sent back to the client
 * as a cookie. If the refresh token is not found or invalid, an appropriate error
 * response is returned.
 *
 * @param {Object} req - The request object, containing cookies with the refresh token.
 * @param {Object} res - The response object, used to send back the new access token or errors.
 */
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({message: "Refresh token not found"});
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refreshToken:${decoded.userId}`);

    if (refreshToken !== storedToken) {
      return res.status(401).json({message: "Invalid refresh token"});
    }

    const accessToken = jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000
    })

    res.status(200).json({message: "Token refreshed successfully"});
  } catch (error) {
    console.error("Error in refreshToken:", error);
    res.status(500).json({message: error.message});
  }
}

export const profile = async (req, res) => {
  try {
    // Return only the necessary user properties to avoid circular references
    const user = req.user;
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // console.error("Error in profile:", error);
    res.status(500).json({message: error.message});
  }
}