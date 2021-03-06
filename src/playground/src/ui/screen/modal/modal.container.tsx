import React from 'react';
import { ModalProps } from '@kitten/ui';
import { ModalShowcase } from './modalShowcase.component';
import { modalShowcase } from './type';
import { ShowcaseContainer } from '../common/showcase.container';

export class ModalContainer extends React.Component {

  private renderItem = (props: ModalProps): React.ReactElement<ModalProps> => {
    return (
      <ModalShowcase {...props}/>
    );
  };

  public render(): React.ReactNode {
    return (
      <ShowcaseContainer
        showcase={modalShowcase}
        renderItem={this.renderItem}>
      </ShowcaseContainer>
    );
  }
}

