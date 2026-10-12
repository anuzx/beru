# api-endpoints

1. `GET /github/install` - Redirect to GitHub's App installation page
2. `GET /github/installed` - Verify installation callback, persist it, redirect to dashboard
3. `GET /github/installations` - List installations connected to the signed-in user
4. `GET /github/repositories` - List repositories available through a verified installation


5. `POST /tasks`	Create a task and enqueue it
6. `GET	/tasks/:taskId`	Get task status and result
7. `GET	/tasks/:taskId/events`	Stream task progress to the frontend
8. `POST /tasks/:taskId/cancel`	Request cancellation
9. `GET	/tasks/:taskId/pull-request`	Get the created PR details