import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { arabicLabel } from '../arabic';

/** Localize display children; attributes, values, handlers and element identity are preserved. */
export function arabicContent(content: ReactNode): ReactNode {
  return Children.map(content, child => {
    if (typeof child==='string'||typeof child==='number') return arabicLabel(child);
    if (!isValidElement<{children?:ReactNode;dangerouslySetInnerHTML?:unknown}>(child)) return child;
    if (typeof child.type!=='string'||['input','textarea','code','pre','script','style'].includes(child.type)||child.props.dangerouslySetInnerHTML) return child;
    if (child.props.children===undefined) return child;
    return cloneElement(child,undefined,arabicContent(child.props.children));
  });
}
