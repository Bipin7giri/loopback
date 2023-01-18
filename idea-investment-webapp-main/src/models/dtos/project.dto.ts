import {model, property} from '@loopback/repository';
import {ORDERSTATUS} from '../../enums';
import {Project} from '../project.model';

@model({
  name: 'projectDTO',
})
export class ProjectDTO extends Project {
  @property({
    type: 'number',
    required: true,
  })
  shareHolders: number;
  @property({
    type: 'string',
    required: true,
  })
  content: string;

  constructor(data?: Partial<ProjectDTO>) {
    super(data);

    this.shareHolders = this.investments
      ? [
          ...new Set(
            this.investments
              .filter(({status}) => status === ORDERSTATUS.completed)
              .map(({orderById}) => orderById),
          ),
        ].length
      : 0;
  }
}
