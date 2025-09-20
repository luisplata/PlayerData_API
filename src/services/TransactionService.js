/**
 * TransactionService - Service Layer
 * Handles database transactions
 */
const db = require('../../DB/db.js');
const { customLogger } = require('../../utils/logger');

class TransactionService {
  /**
   * Execute a function within a database transaction
   * @param {Function} callback - Function to execute within transaction
   * @returns {Promise} Result of the callback function
   */
  async executeTransaction(callback) {
    const trx = await db.transaction();
    
    try {
      const result = await callback(trx);
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      customLogger.error('Transaction failed, rolled back:', error);
      throw error;
    }
  }

  /**
   * Execute multiple operations atomically
   * @param {Array<Function>} operations - Array of functions to execute
   * @returns {Promise<Array>} Results of all operations
   */
  async executeAtomicOperations(operations) {
    return this.executeTransaction(async (trx) => {
      const results = [];
      
      for (const operation of operations) {
        const result = await operation(trx);
        results.push(result);
      }
      
      return results;
    });
  }

  /**
   * Execute operations with retry logic
   * @param {Function} callback - Function to execute
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} delay - Delay between retries in ms
   * @returns {Promise} Result of the callback function
   */
  async executeWithRetry(callback, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeTransaction(callback);
      } catch (error) {
        lastError = error;
        
        // Don't retry on validation errors or business logic errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          customLogger.warn(`Transaction attempt ${attempt} failed, retrying in ${delay}ms:`, error.message);
          await this.delay(delay);
          delay *= 2; // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Check if an error should not be retried
   * @param {Error} error - Error to check
   * @returns {boolean} True if error should not be retried
   */
  isNonRetryableError(error) {
    const nonRetryableErrors = [
      'ValidationError',
      'UnauthorizedError',
      'NotFoundError',
      'ConflictError'
    ];
    
    return nonRetryableErrors.some(errorType => 
      error.name === errorType || error.message.includes(errorType)
    );
  }

  /**
   * Delay execution for specified milliseconds
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute a read-only transaction
   * @param {Function} callback - Function to execute
   * @returns {Promise} Result of the callback function
   */
  async executeReadOnlyTransaction(callback) {
    const trx = await db.transaction();
    
    try {
      // Set transaction to read-only mode
      await trx.raw('SET TRANSACTION READ ONLY');
      const result = await callback(trx);
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      customLogger.error('Read-only transaction failed:', error);
      throw error;
    }
  }
}

module.exports = TransactionService;
