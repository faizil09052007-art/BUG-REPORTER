import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({ status: 'error', message: errorMessage });
    }
    
    next();
  };
};

// Validation Schemas
export const schemas = {
  registerUser: Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'developer', 'qa', 'stakeholder')
  }),
  
  loginUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createTicket: Joi.object({
    title: Joi.string().required().max(100),
    description: Joi.string().required(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical'),
    tags: Joi.array().items(Joi.string())
  }),

  updateTicketStatus: Joi.object({
    status: Joi.string().valid('New', 'In-Progress', 'Resolved', 'Closed').required()
  })
};
