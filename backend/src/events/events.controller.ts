import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser, Roles } from '../auth/decorators/roles.decorator';
import { CreateEventDTO, UpdateEventDTO } from './dto/create-event';
import { TransformPipe } from '@/pipe/transform.pipe';
import { AccountOwnerGuard } from '@/auth/guards/owner.guard';
import { PayloadDto } from '@/@types';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    return this.eventsService.findAll({ status, category });
  }

  // @Get('public')
  // AllEvent(
  //   @Query('status') status?: string,
  //   @Query('category') category?: string,
  // ) {
  //   return this.eventsService.findAll({ status, category });
  // }
  @Get('my-rsvps')
  @UseGuards(JwtAuthGuard, AccountOwnerGuard)
  getMyRsvps(@Request() req) {
    return this.eventsService.getMyRsvps(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() data: CreateEventDTO, @CurrentUser() user: any) {
    return this.eventsService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body(
      new TransformPipe(UpdateEventDTO, ['createdAt', '_count'], {
        price: 'eventFee',
        capacity: 'maxAttendees',
        'agenda.description': 'agenda.O.title',
      }),
    )
    data: UpdateEventDTO,
  ) {
    console.log(data);

    return this.eventsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.eventsService.delete(id);
  }

  @Post(':id/rsvp')
  @UseGuards(JwtAuthGuard)
  toggleRsvp(@Param('id') id: string, @CurrentUser() user: PayloadDto) {
    return this.eventsService.toggleRsvp(id, user.id);
  }
}
