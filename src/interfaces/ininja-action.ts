export interface INinjaAction {
  id: string;
  title: string;
  hotkey?: string;
  handler?: Function;
  matcher?: Function;
  mdIcon?: string;
  icon?: string;
  parent?: string;
  keywords?: string;
  children?: string[];
  section?: string;
}
