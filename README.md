# baFive - Connect with Your Colleagues

baFive is a workplace networking application that helps employees connect with colleagues for office meetings, lunch, travel planning, and more. Before 5 (office hours) and After 5 (personal time).

## Features

- **Login & Authentication**: Secure login and signup pages
- **Profile Discovery**: Browse colleague profiles with a Hinge-like card interface
- **Matching System**: Like profiles and see who's liked you back
- **Department Information**: See colleagues' departments and roles
- **Interest Tags**: Connect based on shared interests
- **Messages**: Direct messaging with matched connections
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Icons**: Lucide React
- **Styling**: CSS3

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd baFive
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Demo Login

Use the demo credentials to test the application:
- Email: `demo@example.com`
- Password: `demo`

Or create a new account during signup.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
baFive/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ProfileCard.tsx  # Main profile card component
│   ├── pages/               # Page components
│   │   ├── LoginPage.tsx    # Login/Signup page
│   │   └── HomePage.tsx     # Main home page
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Design Inspiration

The UI is inspired by Hinge with:
- Warm peachy/coral color scheme (#f5627a primary color)
- Clean, modern typography
- Card-based profile discovery
- Smooth animations and transitions
- Intuitive like/pass interaction

## Future Enhancements

- [ ] Real backend integration
- [ ] Messaging system implementation
- [ ] User profile editing
- [ ] Advanced search and filters
- [ ] Mobile app version
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] User preferences and settings

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is private and confidential.
