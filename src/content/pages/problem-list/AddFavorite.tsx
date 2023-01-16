import { AddIcon } from '@/components/icons'
import { css } from 'styled-components/macro'
import Editor from './Editor'

interface AddFavoriteProps {
  onSave?: (text: string) => void | Promise<void>
  onCancel?: (...arg: any) => void | Promise<void>
  toggleEnableEdit: (...arg: any) => void | Promise<void>
  enableEdit: boolean
}

const AddFavorite: React.FC<AddFavoriteProps> = ({
  enableEdit,
  toggleEnableEdit,
  ...props
}) => {
  return (
    <div
      css={css`
        padding: 4px 16px;
        position: relative;
        display: flex;
        align-items: center;
        margin-top: 6px;
      `}
    >
      {enableEdit ? (
        <Editor {...props} />
      ) : (
        <div
          css={css`
            width: 100%;
            padding: 1px 0;
            text-align: center;
            cursor: pointer;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: ${props => props.theme.palette.secondary.main};
            &:hover {
              background-color: ${props => props.theme.palette.secondary.hover};
            }
          `}
          onClick={toggleEnableEdit}
        >
          <AddIcon height={14} />
          <span>创建新题单</span>
        </div>
      )}
    </div>
  )
}

export default AddFavorite
