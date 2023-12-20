import { Home } from "./components/Home";
import { HostQuiz } from "./components/HostQuiz";
import { PlayQuiz } from "./components/PlayQuiz";

const AppRoutes = [
    {
        index: true,
        element: <Home />
    },
    {
        path: '/playquiz',
        element: <PlayQuiz />
    },
    {
        path: '/hostquiz',
        element: <HostQuiz />
    }
];

export default AppRoutes;
