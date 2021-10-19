export interface INinjaAction {
  id: string;
  title: string;
  hotkey?: string;
  handler?: Function;
  href?: string;
  icon?: string;
  parent?: string;
  children?: string[];
  section?: string;
}
