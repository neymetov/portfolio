// Иконки меню из макета. Ключи совпадают с именами слоёв в Figma и со значениями
// select-поля `icon` в Keystatic — добавляя иконку, добавь её в оба места.
import box from './box.svg';
import cursor05 from './cursor-05.svg';
import inbox02 from './inbox-02.svg';
import instagram from './instagram.svg';
import linkedin02 from './linkedin-02.svg';
import menu05 from './menu-05.svg';
import telegram from './telegram.svg';
import x02 from './x-02.svg';

export const icons = {
  'cursor-05': cursor05,
  box,
  'inbox-02': inbox02,
  instagram,
  telegram,
  'linkedin-02': linkedin02,
  'menu-05': menu05,
  'x-02': x02,
};

export type IconName = keyof typeof icons;
