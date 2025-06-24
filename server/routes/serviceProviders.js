import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// Get all service providers with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { category, location, search, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('service_providers')
      .select('*, services(*), reviews(*)');

    if (category) {
      query = query.eq('category', category);
    }
    if (location) {
      query = query.eq('location', location);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: providers, error } = await query
      .order('average_rating', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    const { count } = await supabase
      .from('service_providers')
      .select('*', { count: 'exact', head: true });

    res.json({
      providers,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get service provider by ID
router.get('/:id', async (req, res) => {
  try {
    const { data: provider, error } = await supabase
      .from('service_providers')
      .select(`
        *,
        services(*),
        reviews(*, user:auth.users(email))
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!provider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create service provider
router.post('/', async (req, res) => {
  try {
    const { data: provider, error } = await supabase
      .from('service_providers')
      .insert([{ ...req.body }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(provider);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update service provider
router.put('/:id', async (req, res) => {
  try {
    const { data: provider, error } = await supabase
      .from('service_providers')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(provider);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add review
router.post('/:id/reviews', async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;
    
    const { data: review, error } = await supabase
      .from('reviews')
      .insert([{
        provider_id: req.params.id,
        user_id: userId,
        rating,
        comment
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;