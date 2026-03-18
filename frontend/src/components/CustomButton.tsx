import type { ReactNode } from "react";
import { Button } from "@mui/material";

const CustomButton = ({ children, onClick }: {
  children: ReactNode,
  onClick: any
}) => {
  return (
    <Button
      onClick={onClick}
      variant="contained"
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        px: 3,
        py: 1.2,
        borderRadius: '12px',

        background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
        color: 'white',

        boxShadow: '0 6px 20px rgba(59,130,246,0.35)',
        backdropFilter: 'blur(6px)',

        transition: 'all 0.2s ease',

        '&:hover': {
          background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
          boxShadow: '0 8px 25px rgba(59,130,246,0.5)',
          transform: 'translateY(-1px)',
        },

        '&:active': {
          transform: 'translateY(0px)',
          boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
        },
      }}
    >
      {children}
    </Button>
  )
}

export default CustomButton;