import { css } from "@emotion/react";
import styled from "@emotion/styled";
import Button from "metabase/core/components/Button";
import { Icon } from "metabase/core/components/Icon";
import { alpha, color } from "metabase/lib/colors";
import { space } from "metabase/styled-components/theme";

export const Header = styled.h4`
  width: 100%;
  color: ${color("text-medium")};
  margin-bottom: ${space(1)};
  text-align: center;
`;
export const TargetButton = styled.div<{ variant: string }>`
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${color("white")};
  text-weight: bold;
  cursor: pointer;
  border: 2px solid ${color("brand")};
  border-radius: 8px;
  min-height: 30px;
  padding: 0.25em 0.5em;
  margin: 0 0.25rem;
  color: ${color("text-medium")};

  ${({ variant }) =>
    variant === "disabled" &&
    css`
      pointer-events: none;
      opacity: 0.4;
      border-color: inherit;
    `}

  ${({ variant }) =>
    variant === "mapped" &&
    css`
      border-color: ${color("brand")};
      background-color: ${color("brand")};
      color: ${color("white")};
    `}

  ${({ variant }) =>
    variant === "unauthed" &&
    css`
      pointer-events: none;
      border-color: ${color("bg-light")};
      background-color: ${color("bg-light")};
      color: ${color("text-medium")};
    `}

  ${({ variant }) =>
    variant === "invalid" &&
    css`
      border-color: ${color("error")};
      background-color: ${color("error")};
      color: ${color("white")};
    `}
`;

TargetButton.defaultProps = {
  tabIndex: 0,
  role: "button",
};
export const TargetButtonText = styled.span`
  overflow: hidden;
  text-align: center;
  margin-right: ${space(1)};
`;
export const CloseIconButton = styled(Button)<{ icon?: string; size?: number }>`
  color: ${color("white")};
  background-color: transparent;
  border: none;
  padding: ${space(0)} !important;

  &:hover {
    color: ${color("white")};
    background-color: ${alpha("white", 0.2)};
  }
`;
export const ChevrondownIcon = styled(Icon)`
  margin-top: 2px;
`;
export const KeyIcon = styled(Icon)`
  flex: 1;
`;

KeyIcon.defaultProps = {
  name: "key",
  size: 18,
};