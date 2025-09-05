import redisClient from "../config/redisClient";

// Read a value from Redis
export const getValue = async (key: string): Promise<string | null> => {
  return (await redisClient.get(key)) as string | null;
};

// Write a value to Redis
export const setValue = async (
  key: string,
  value: string,
  expirationInSeconds?: number
): Promise<void> => {
  if (expirationInSeconds) {
    await redisClient.setEx(key, expirationInSeconds, value);
  } else {
    await redisClient.set(key, value);
  }
};

export const updateValue = async (
  key: string,
  value: string,
  expirationInSeconds?: number
): Promise<void> => {
  await setValue(key, value, expirationInSeconds);
};

// Delete a value from Redis
export const deleteValue = async (key: string): Promise<number> => {
  return (await redisClient.del(key)) as number;
};

// Check if a key exists
export const keyExists = async (key: string): Promise<boolean> => {
  const result = await redisClient.exists(key);
  return result === 1;
};

// Increment a numeric value
export const incrementValue = async (key: string): Promise<number> => {
  return (await redisClient.incr(key)) as number;
};

// Decrement a numeric value
export const decrementValue = async (key: string): Promise<number> => {
  return (await redisClient.decr(key)) as number;
};

// Get multiple values
export const getMultipleValues = async (
  keys: string[]
): Promise<string[]> => {
  return (await redisClient.mGet(keys)) as string[];
};

// Set multiple key-value pairs
export const setMultipleValues = async (
  keyValuePairs: [string, string][]
): Promise<string> => {
  return (await redisClient.mSet(keyValuePairs)) as string;
};
