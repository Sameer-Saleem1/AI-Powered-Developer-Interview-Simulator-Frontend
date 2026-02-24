## Packages
framer-motion | Smooth page transitions and element animations
recharts | Beautiful charts for dashboard statistics
canvas-confetti | Celebration effect for completing an interview
@types/canvas-confetti | TypeScript definitions for canvas-confetti

## Notes
- App uses JWT authentication stored in localStorage as 'auth_token'.
- All API requests intercept and attach the Authorization Bearer header.
- Assuming Shadcn UI primitives (Card, Button, Input, etc.) are available in `@/components/ui/`.
- Routes and schemas are imported from `@shared/routes` and `@shared/schema`.
