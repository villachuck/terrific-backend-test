const express = require('express');
const cors = require('cors');
const app = express();
const supabase = require("./client/supabaseClient");

app.use(cors());
app.use(express.json());

//Login to Supabase
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
  
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
  
    if (error) {
      return res.status(400).json({ error: error.message, status: 400 });
    }

    const session_token = data.session?.access_token;
    const supb_user = data.user?.id;
  
    res.status(200).json({ status: 200, token: session_token, user: supb_user });
});

//Find user
app.post('/api/getUser', async (req, res) => {
  const { email, supabase_uid } = req.body;
  const token = req.headers.authorization.split(' ')[1];

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('base_id', supabase_uid)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json({ status: 200, id: data.id });
});

//Registration on Supabase for new users
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  // Registrar usuario en Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json({status: 200, data});
});

//List all categories
app.get('/api/categories', async (req, res) => {
  const { data, error } = await supabase
    .from('list_categories')
    .select('*');
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

//New category
app.post('/api/categories', async (req, res) => {
  const { name, active, updated_at } = req.body;
  const { data, error } = await supabase
    .from('list_categories')
    .insert([{ name, active, updated_at }]);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
}); 

//Update category
app.patch('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const fieldsToUpdate = req.body;

  const { data, error } = await supabase
    .from('list_categories')
    .update(fieldsToUpdate)
    .eq('id', id);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json({ message: 'Registro actualizado correctamente', data });
});  

//Get todo lists filtered by client, date & status active
app.get('/api/lists/:userId/:date', async (req, res) => {
  const { userId, date } = req.params;

  const { data, error } = await supabase  
  .from('todolist_general_data')
  .select('*')
  .eq('user_id', userId)
  .eq('scheduled', date)
  .eq('active', true)
  .order('id', { ascending: false });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
});

//Get all todo lists by user
app.get('/api/lists/:userId', async (req, res) => {
  const { userId, date } = req.params;

  const { data, error } = await supabase  
  .from('todolist_general_data')
  .select('*')
  .eq('user_id', userId)
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
});

//Get list by Id
app.get('/api/listById/:listId', async (req, res) => {
  const { listId } = req.params;

  const { data, error } = await supabase  
  .from('todolist_general_data')
  .select('*')
  .eq('id', listId)
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json({status: 200, data});
});

//Create new todo list
app.post('/api/lists/new', async (req, res) => {
  const { created_at, user_id, active, category, list_name, scheduled, status, updated_at } = req.body;
  const token = req.headers.authorization.split(' ')[1];

  const { data, error } = await supabase
  .from('todolist_general_data')
  .insert([{ created_at, user_id, active, category, list_name, scheduled, status, updated_at }]);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json({ status: 200});
});

//Update todo list (change status, name or delete task)
app.patch('/api/lists/update/:listId', async (req, res) => {
  const { listId } = req.params;
  const list_fields = req.body; 
  const { data, error } = await supabase
  .from('todolist_general_data')
  .update(list_fields)
  .eq('id', listId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ status: 200 });

});

//Get tasks by list ID
app.get('/api/details/:listId', async (req, res) => {
  const { listId } = req.params;

  const { data, error } = await supabase  
  .from('todolist_items')
  .select('*')
  .eq('todolist_id', listId)
  .eq('active', true)
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
});

//Create new task
app.post('/api/details/new', async (req, res) => {
  const { created_at, active, completed_task, item_description, todolist_id, updated_at } = req.body;

  const { data, error } = await supabase
  .from('todolist_items')
  .insert([{ created_at, active, completed_task, item_description, todolist_id, updated_at }]);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json({ status: 200});
});

//Update task (change status or delete task)
app.patch('/api/details/update/:listId', async (req, res) => {
  const { listId } = req.params;
  const fields = req.body; 
  const { data, error } = await supabase
  .from('todolist_items')
  .update(fields)
  .eq('id', listId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ status: 200 });

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

