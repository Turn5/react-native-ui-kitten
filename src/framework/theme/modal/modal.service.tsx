/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import React from 'react';
import { ModalPresentingBased } from '../../ui/support/typings';

/**
 * Singleton service designed to manage modal components.
 *
 * @type ModalServiceType
 *
 * @method {(element: React.ReactElement<ModalPresentingBased>, config: ModalPresentingConfig) => string} show -
 * Shows component in a modal window. Returns its id.
 *
 * @method {(identifier: string) => string} hide - Hides component from a modal window and returns empty string.
 *
 * @example Simple Usage example
 *
 * ```
 * import React from 'react';
 * import {
 *   View,
 *   ViewProps,
 * } from 'react-native';
 * import {
 *   Button,
 *   Text,
 *   ModalService,
 * } from 'react-native-ui-kitten';
 *
 * export const ModalServiceShowcase = (): React.ReactElement<ViewProps> => {
 *
 *   const modalID: string = '';
 *
 *   const showModal = () => {
 *     const component: React.ReactElement<ViewProps> = this.renderModalContentElement();
 *
 *     this.modalID = ModalService.show(component, { allowBackdrop: true, onBackdropPress: this.hideModal });
 *   };
 *
 *   const hideModal = () => {
 *     ModalService.hide(this.modalID);
 *   };
 *
 *   const renderModalContentElement = (): React.ReactElement<ViewProps> => {
 *     return (
 *       <View>
 *         <Text>Hi, I'm modal!</Text>
 *       </View>
 *     );
 *   };
 *
 *   return (
 *     <View>
 *       <Button onPress={this.showModal}>
 *         SHOW MODAL
 *       </Button>
 *       <Button onPress={this.hideModal}>
 *         HIDE MODAL
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */

class ModalServiceType {

  panel: ModalPresenting | null = null;

  public mount(panel: ModalPresenting | null): void {
    this.panel = panel;
  }

  public unmount(): void {
    this.panel = null;
  }

  public show(element: React.ReactElement<ModalPresentingBased>,
              config: ModalPresentingConfig): string {

    if (this.panel) {
      return this.panel.show(element, config);
    }
  }

  public hide(identifier: string): string {
    if (this.panel) {
      return this.panel.hide(identifier);
    }
  }
}

export interface ModalPresentingConfig {
  allowBackdrop: boolean;
  onBackdropPress: () => void;
}

export interface ModalPresenting {
  show(element: React.ReactElement<ModalPresentingBased>,
       config: ModalPresentingConfig): string;

  hide(identifier: string): string;
}

export const ModalService = new ModalServiceType();
