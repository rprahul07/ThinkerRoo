const supabase = require('../config/supabase');

const TABLE = 'users';

const getAllUsers = async (_req, res) => {
  const { data, error } = await supabase.from(TABLE).select('*');
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.status(200).json({ success: true, count: data.length, data });
};

const getUserById = async (req, res) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ success: false, message: error.message });
  res.status(200).json({ success: true, data });
};

const createUser = async (req, res) => {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(req.body)
    .select()
    .single();
  if (error) return res.status(400).json({ success: false, message: error.message });
  res.status(201).json({ success: true, data });
};

const updateUser = async (req, res) => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(req.body)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ success: false, message: error.message });
  res.status(200).json({ success: true, data });
};

const deleteUser = async (req, res) => {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(400).json({ success: false, message: error.message });
  res.status(200).json({ success: true, message: 'User deleted' });
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
