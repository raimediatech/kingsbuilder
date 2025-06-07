// api/templates.js - Simple API for template management
const express = require('express');
const router = express.Router();

// Pre-defined templates
const templates = [
  {
    id: 'blank',
    name: 'Blank Page',
    description: 'Start with a clean slate',
    thumbnail: 'https://via.placeholder.com/300x200?text=Blank',
    category: 'basic',
    content: {
      sections: []
    }
  },
  {
    id: 'about',
    name: 'About Us',
    description: 'Perfect for sharing your brand story',
    thumbnail: 'https://via.placeholder.com/300x200?text=About+Us',
    category: 'marketing',
    content: {
      sections: [
        {
          type: 'hero',
          settings: {
            heading: 'About Our Company',
            subheading: 'Learn more about who we are and what we do',
            background_color: '#f5f5f5',
            text_color: '#333333',
            alignment: 'center',
            padding: '60px'
          }
        },
        {
          type: 'text_with_image',
          settings: {
            heading: 'Our Story',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Cras justo odio, dapibus ac facilisis in, egestas eget quam.',
            image: 'https://via.placeholder.com/600x400',
            image_position: 'right',
            background_color: '#ffffff',
            text_color: '#333333',
            padding: '60px'
          }
        },
        {
          type: 'team',
          settings: {
            heading: 'Meet Our Team',
            background_color: '#f9f9f9',
            text_color: '#333333',
            padding: '60px',
            team_members: [
              {
                name: 'John Doe',
                title: 'CEO & Founder',
                image: 'https://via.placeholder.com/300x300',
                bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
              },
              {
                name: 'Jane Smith',
                title: 'Creative Director',
                image: 'https://via.placeholder.com/300x300',
                bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
              },
              {
                name: 'Mike Johnson',
                title: 'Lead Developer',
                image: 'https://via.placeholder.com/300x300',
                bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
              }
            ]
          }
        }
      ]
    }
  },
  {
    id: 'contact',
    name: 'Contact Page',
    description: 'Help customers reach you easily',
    thumbnail: 'https://via.placeholder.com/300x200?text=Contact',
    category: 'marketing',
    content: {
      sections: [
        {
          type: 'hero',
          settings: {
            heading: 'Contact Us',
            subheading: 'We\'d love to hear from you',
            background_color: '#f5f5f5',
            text_color: '#333333',
            alignment: 'center',
            padding: '60px'
          }
        },
        {
          type: 'contact_form',
          settings: {
            heading: 'Send us a message',
            background_color: '#ffffff',
            text_color: '#333333',
            padding: '60px',
            form_fields: [
              {
                type: 'text',
                label: 'Name',
                required: true
              },
              {
                type: 'email',
                label: 'Email',
                required: true
              },
              {
                type: 'text',
                label: 'Subject',
                required: true
              },
              {
                type: 'textarea',
                label: 'Message',
                required: true
              }
            ],
            submit_button_text: 'Send Message',
            submit_button_color: '#2c6ecb'
          }
        },
        {
          type: 'map',
          settings: {
            heading: 'Visit Us',
            address: '123 Main St, Anytown, USA',
            map_height: '400px',
            background_color: '#f9f9f9',
            text_color: '#333333',
            padding: '60px'
          }
        }
      ]
    }
  },
  {
    id: 'faq',
    name: 'FAQ Page',
    description: 'Answer common customer questions',
    thumbnail: 'https://via.placeholder.com/300x200?text=FAQ',
    category: 'marketing',
    content: {
      sections: [
        {
          type: 'hero',
          settings: {
            heading: 'Frequently Asked Questions',
            subheading: 'Find answers to common questions about our products and services',
            background_color: '#f5f5f5',
            text_color: '#333333',
            alignment: 'center',
            padding: '60px'
          }
        },
        {
          type: 'faq',
          settings: {
            background_color: '#ffffff',
            text_color: '#333333',
            padding: '60px',
            faq_items: [
              {
                question: 'How do I place an order?',
                answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit.'
              },
              {
                question: 'How long does shipping take?',
                answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit.'
              },
              {
                question: 'What is your return policy?',
                answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit.'
              },
              {
                question: 'Do you ship internationally?',
                answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit.'
              }
            ]
          }
        },
        {
          type: 'cta',
          settings: {
            heading: 'Still have questions?',
            subheading: 'Contact our support team for more information',
            button_text: 'Contact Us',
            button_link: '/contact',
            background_color: '#f9f9f9',
            text_color: '#333333',
            padding: '60px'
          }
        }
      ]
    }
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Perfect for product launches or promotions',
    thumbnail: 'https://via.placeholder.com/300x200?text=Landing',
    category: 'marketing',
    content: {
      sections: [
        {
          type: 'hero',
          settings: {
            heading: 'Introducing Our New Product',
            subheading: 'The best thing since sliced bread',
            background_image: 'https://via.placeholder.com/1600x800',
            text_color: '#ffffff',
            alignment: 'center',
            padding: '120px',
            button_text: 'Shop Now',
            button_link: '/products/new-product'
          }
        },
        {
          type: 'features',
          settings: {
            heading: 'Key Features',
            background_color: '#ffffff',
            text_color: '#333333',
            padding: '60px',
            features: [
              {
                icon: 'star',
                title: 'Premium Quality',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
              },
              {
                icon: 'shield',
                title: 'Durable Design',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
              },
              {
                icon: 'heart',
                title: 'Customer Favorite',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
              }
            ]
          }
        },
        {
          type: 'testimonials',
          settings: {
            heading: 'What Our Customers Say',
            background_color: '#f9f9f9',
            text_color: '#333333',
            padding: '60px',
            testimonials: [
              {
                quote: 'This product changed my life! I can\'t imagine going back to my old routine.',
                author: 'Jane D.',
                location: 'New York, NY'
              },
              {
                quote: 'Absolutely love it. Worth every penny and more!',
                author: 'John S.',
                location: 'Los Angeles, CA'
              },
              {
                quote: 'The quality is outstanding. Highly recommend!',
                author: 'Sarah M.',
                location: 'Chicago, IL'
              }
            ]
          }
        },
        {
          type: 'cta',
          settings: {
            heading: 'Limited Time Offer',
            subheading: 'Get 20% off when you order today',
            button_text: 'Shop Now',
            button_link: '/products/new-product',
            background_color: '#2c6ecb',
            text_color: '#ffffff',
            padding: '60px'
          }
        }
      ]
    }
  }
];

// Get all templates
router.get('/', (req, res) => {
  // Return simplified template list without full content
  const templateList = templates.map(({ id, name, description, thumbnail, category }) => ({
    id,
    name,
    description,
    thumbnail,
    category
  }));
  
  res.json(templateList);
});

// Get a specific template
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const template = templates.find(t => t.id === id);
  
  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }
  
  res.json(template);
});

module.exports = router;