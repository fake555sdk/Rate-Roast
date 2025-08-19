export class ValidationService {
  // User input validation
  static validateUsername(username: string): { isValid: boolean; error?: string } {
    if (!username || username.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters long' };
    }
    
    if (username.length > 30) {
      return { isValid: false, error: 'Username must be less than 30 characters' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }
    
    return { isValid: true };
  }

  static validateBio(bio: string): { isValid: boolean; error?: string } {
    if (bio.length > 500) {
      return { isValid: false, error: 'Bio must be less than 500 characters' };
    }
    
    return { isValid: true };
  }

  static validateRoastContent(content: string): { isValid: boolean; error?: string } {
    if (!content || content.trim().length < 10) {
      return { isValid: false, error: 'Roast must be at least 10 characters long' };
    }
    
    if (content.length > 500) {
      return { isValid: false, error: 'Roast must be less than 500 characters' };
    }
    
    // Check for inappropriate content (basic filter)
    const inappropriateWords = [
      // Add inappropriate words here
      'spam', 'scam', 'hack'
    ];
    
    const lowerContent = content.toLowerCase();
    for (const word of inappropriateWords) {
      if (lowerContent.includes(word)) {
        return { isValid: false, error: 'Content contains inappropriate language' };
      }
    }
    
    return { isValid: true };
  }

  static validateRating(rating: number): { isValid: boolean; error?: string } {
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
      return { isValid: false, error: 'Rating must be an integer between 1 and 10' };
    }
    
    return { isValid: true };
  }

  static validateReferralCode(code: string): { isValid: boolean; error?: string } {
    if (!code || code.length !== 6) {
      return { isValid: false, error: 'Referral code must be 6 characters long' };
    }
    
    if (!/^[A-Z0-9]+$/.test(code)) {
      return { isValid: false, error: 'Referral code can only contain uppercase letters and numbers' };
    }
    
    return { isValid: true };
  }

  // Rate limiting validation
  static validateRateLimit(
    lastAction: Date | null, 
    cooldownMinutes: number
  ): { isValid: boolean; error?: string; remainingTime?: number } {
    if (!lastAction) {
      return { isValid: true };
    }
    
    const now = new Date();
    const timeDiff = now.getTime() - lastAction.getTime();
    const cooldownMs = cooldownMinutes * 60 * 1000;
    
    if (timeDiff < cooldownMs) {
      const remainingMs = cooldownMs - timeDiff;
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      
      return {
        isValid: false,
        error: `Please wait ${remainingMinutes} minute(s) before performing this action again`,
        remainingTime: remainingMinutes,
      };
    }
    
    return { isValid: true };
  }

  // Content moderation
  static moderateContent(content: string): {
    isAppropriate: boolean;
    confidence: number;
    flags: string[];
  } {
    const flags: string[] = [];
    let confidence = 1.0;
    
    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.7 && content.length > 10) {
      flags.push('excessive_caps');
      confidence -= 0.1;
    }
    
    // Check for repeated characters
    if (/(.)\1{4,}/.test(content)) {
      flags.push('repeated_characters');
      confidence -= 0.1;
    }
    
    // Check for spam patterns
    if (/(.{1,10})\1{3,}/.test(content)) {
      flags.push('repetitive_content');
      confidence -= 0.2;
    }
    
    // Check for personal information patterns
    if (/\b\d{3}-\d{3}-\d{4}\b|\b\d{10}\b/.test(content)) {
      flags.push('phone_number');
      confidence -= 0.3;
    }
    
    if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(content)) {
      flags.push('email_address');
      confidence -= 0.3;
    }
    
    // Check for URLs
    if (/https?:\/\/[^\s]+/.test(content)) {
      flags.push('contains_url');
      confidence -= 0.2;
    }
    
    return {
      isAppropriate: confidence > 0.5 && flags.length < 3,
      confidence,
      flags,
    };
  }

  // Image validation
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    if (file.size > maxSize) {
      return { isValid: false, error: 'Image must be smaller than 5MB' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Image must be JPEG, PNG, WebP, or GIF format' };
    }
    
    return { isValid: true };
  }

  // Telegram WebApp validation
  static validateTelegramInitData(initData: string): { isValid: boolean; error?: string } {
    if (!initData) {
      return { isValid: false, error: 'No Telegram init data provided' };
    }
    
    try {
      const urlParams = new URLSearchParams(initData);
      const user = urlParams.get('user');
      const hash = urlParams.get('hash');
      
      if (!user || !hash) {
        return { isValid: false, error: 'Invalid Telegram init data format' };
      }
      
      // Parse user data
      const userData = JSON.parse(decodeURIComponent(user));
      if (!userData.id || !userData.first_name) {
        return { isValid: false, error: 'Invalid Telegram user data' };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: 'Failed to parse Telegram init data' };
    }
  }
}