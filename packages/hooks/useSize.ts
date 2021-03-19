/*
 * @Author: 焦质晔
 * @Date: 2021-02-26 08:10:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-26 08:29:16
 */
import { useGlobalConfig } from './useGlobalConfig';

type IProps = {
  size?: string;
  [key: string]: any;
};

export const useSize = (props: IProps): Record<'$size', string> => {
  const $DESIGN = useGlobalConfig();

  return {
    $size: props.size || $DESIGN.size || '',
  };
};
