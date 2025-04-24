import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupBy',
  standalone: true
})
export class GroupByPipe implements PipeTransform {
  transform<T>(collection: T[], property: string): { key: string; value: T[] }[] {
    if (!collection) {
      return [];
    }

    // Define the type for the grouped collection object
    const groupedCollection = collection.reduce((previous: { [key: string]: T[] }, current) => {
      const key = current[property as keyof T] as unknown as string || 'Otros';
      if (!previous[key]) {
        previous[key] = [];
      }
      previous[key].push(current);
      return previous;
    }, {});

    return Object.keys(groupedCollection).map(key => {
      return {
        key,
        value: groupedCollection[key]
      };
    });
  }
}