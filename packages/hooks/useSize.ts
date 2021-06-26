/*
 * @Author: 焦质晔
 * @Date: 2021-02-26 08:10:23
 * @Last Modified by: 焦质晔
 * @Last Modified time: 2021-02-26 08:29:16
 */
import { useGlobalConfig } from './useGlobalConfig';
import { ComponentSize } from '../_utils/types';

type IProps = {
  size?: ComponentSize;
  [key: string]: any;
};

export const useSize = (props: IProps): Record<'$size', ComponentSize | ''> => {
  const $DESIGN = useGlobalConfig();

  return {
    $size: props.size || $DESIGN.size || '',
  };
};
