# Legal Assistant Web Application

A professional legal assistance web application with AI-powered chatbot support, featuring bilingual support (Vietnamese/English).

## Features

- **Bilingual Support**: Full Vietnamese and English language support
- **AI Chatbot**: Professional legal assistance powered by AI
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Professional UI**: Clean, modern interface suitable for legal services
- **Language Switching**: Easy toggle between Vietnamese and English

## Technology Stack

- React 19
- React Router DOM
- Axios for API communication
- CSS3 with responsive design
- Context API for state management

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd legal-assistance-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── Navbar.jsx      # Navigation bar with language switcher
│   ├── Home.jsx        # Home page component
│   ├── About.jsx       # About page component
│   ├── Chatbot.jsx     # AI chatbot component
│   └── *.css           # Component styles
├── contexts/           # React contexts
│   └── LanguageContext.jsx  # Language management
├── locales/            # Translation files
│   └── translations.js # Bilingual content
├── App.jsx             # Main application component
└── main.jsx           # Application entry point
```

## Language Support

The application supports two languages:

- **Vietnamese (vi)**: Default language with professional legal terminology
- **English (en)**: Full English translation with formal tone

### Adding New Languages

To add a new language:

1. Add the new language object to `src/locales/translations.js`
2. Follow the existing structure with all required keys
3. Update the language switcher in `Navbar.jsx` if needed

## API Integration

The chatbot integrates with an external API endpoint for AI responses. Update the API URL in `Chatbot.jsx` as needed:

```javascript
const response = await axios.post('YOUR_API_ENDPOINT/chat', {
  message: userMessage.content,
  conversation_history: conversationHistory
});
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.
