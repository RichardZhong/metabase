import type { ReactNode } from "react";
import { Icon } from "metabase/core/components/Icon";
import { Button } from "metabase/ui";

interface BackButtonProps {
  children?: ReactNode;
  onClick?: () => void;
}

export function BackButton({ children, onClick }: BackButtonProps) {
  return (
    <Button
      c="text.1"
      display="block"
      variant="subtle"
      leftIcon={<Icon name="chevronleft" />}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}