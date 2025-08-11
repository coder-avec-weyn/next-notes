export interface Poetry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  style: {
    font: string;
    alignment: string;
    lineSpacing: number;
    fontSize: string;
    indentation: number;
    firstLineIndent: boolean;
    italics: boolean;
    bold: boolean;
    uppercase: boolean;
  };
  tags: string[];
  color: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_pinned: boolean;
  is_public: boolean;
  mood?: string;
  theme?: string;
  created_at: string;
  updated_at: string;
}