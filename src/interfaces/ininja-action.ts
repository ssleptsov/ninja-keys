export interface INinjaAction {
  id: string;
  title: string;
  hotkey?: string;
  handler?: Function;
  href?: string;
  mdIcon?: string;
  icon?: string;
  parent?: string;
  keywords?: string;
  children?: string[];
  section?: string;
}
