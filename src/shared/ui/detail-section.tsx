import type { ReactNode } from 'react';
export function DetailSection({title,description,children,open=false}:{title:string;description?:string;children:ReactNode;open?:boolean}){
 return <details className="detail-section" open={open}><summary><span><strong>{title}</strong>{description&&<small>{description}</small>}</span><span aria-hidden="true">＋</span></summary><div className="detail-section-body">{children}</div></details>;
}
