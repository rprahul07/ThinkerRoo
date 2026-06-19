const mockSupabase = {
  data: null,
  error: null,
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockReturnThis(),
  then: jest.fn(function (onFulfilled) {
    onFulfilled({ data: this.data, error: this.error });
  }),
};

module.exports = mockSupabase;
