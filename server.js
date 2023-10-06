const express = require('express');
const axios = require('axios');
const lodash = require('lodash');

const app = express();

async function fetchBD() {
 try {
    const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
      headers: {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
      }
    });
    return response.data.blogs;
 } catch (error) {
    throw error;
 }
}

const memoizedFetchBD = lodash.memoize(fetchBD);

app.get('/api/blog-stats', async (req, res) => {
 try {
    const blogs = await memoizedFetchBD();
    const total = blogs.length;
    const longest = blogs.reduce((max, blog) => (blog.title.length > max.title.length ? blog : max), blogs[0]);
    const privacy = blogs.filter((blog) => blog.title.toLowerCase().includes('privacy'));
    const unique = [...new Set(blogs.map((blog) => blog.title))];

    res.json({ total, longest: longest.title, privacy: privacy.length, unique });
 } catch (error) {
    console.error('Error', error.message);
    res.status(500).json({ error: 'Error' });
 }
});

app.get('/api/blog-search', async (req, res) => {
 const query = req.query.query.toLowerCase();

 try {
    const blogs = await memoizedFetchBD();
    const match = blogs.filter((blog) => blog.title.toLowerCase().includes(query));
    res.json(match);
 } catch (error) {
    console.error('Error', error.message);
    res.status(500).json({ error: 'Error' });
 }
});

app.listen(3000, () => {
 console.log('Server is running on port 3000');
});